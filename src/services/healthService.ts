import { apiClient } from './api';
import { HealthStatus } from '../types';
import { isNetworkError, isServerError, withErrorHandling } from '../utils/errorHandling';
import { transformHealthResponse } from '../utils/responseTransformers';
import { 
  withRetry, 
  analyzeConnectionError, 
  isApiUnavailable,
  DEFAULT_RETRY_CONFIG 
} from '../utils/connectionErrorHandler';

/**
 * Health check result with additional metadata
 */
export interface HealthCheckResult {
  status: HealthStatus;
  isHealthy: boolean;
  responseTime: number;
  timestamp: string;
}

/**
 * Health monitoring configuration
 */
export interface HealthMonitorConfig {
  interval: number; // milliseconds
  timeout: number; // milliseconds
  maxRetries: number;
  onHealthChange?: (isHealthy: boolean, status?: HealthStatus) => void;
  onError?: (error: Error) => void;
}

/**
 * Service for health monitoring operations
 */
export class HealthService {
  private monitoringInterval?: NodeJS.Timeout;
  private lastHealthStatus?: HealthStatus;
  private isCurrentlyHealthy: boolean = true;

  /**
   * Check API health status
   */
  async checkHealth(): Promise<HealthStatus> {
    return withErrorHandling(async () => {
      const response = await apiClient.get<any>('/health');
      return transformHealthResponse(response);
    }, 'HealthService.checkHealth');
  }

  /**
   * Check health with retry logic
   */
  async checkHealthWithRetry(maxAttempts: number = 3): Promise<HealthStatus> {
    return withRetry(
      () => this.checkHealth(),
      { ...DEFAULT_RETRY_CONFIG, maxAttempts }
    );
  }

  /**
   * Perform a comprehensive health check with timing and error handling
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    try {
      const status = await this.checkHealth();
      const responseTime = Date.now() - startTime;
      const isHealthy = this.evaluateHealthStatus(status);

      return {
        status,
        isHealthy,
        responseTime,
        timestamp
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Create a fallback health status for error cases
      const fallbackStatus: HealthStatus = {
        status: 'unhealthy',
        timestamp,
        database: 'unknown',
        redis: 'unknown',
        version: 'unknown',
        uptime: 0
      };

      return {
        status: fallbackStatus,
        isHealthy: false,
        responseTime,
        timestamp
      };
    }
  }

  /**
   * Start continuous health monitoring
   */
  startMonitoring(config: HealthMonitorConfig): void {
    // Stop existing monitoring if running
    this.stopMonitoring();

    this.monitoringInterval = setInterval(async () => {
      try {
        const result = await this.performHealthCheck();
        
        // Check if health status changed
        const wasHealthy = this.isCurrentlyHealthy;
        this.isCurrentlyHealthy = result.isHealthy;
        
        if (wasHealthy !== this.isCurrentlyHealthy && config.onHealthChange) {
          config.onHealthChange(this.isCurrentlyHealthy, result.status);
        }
        
        this.lastHealthStatus = result.status;
      } catch (error) {
        const wasHealthy = this.isCurrentlyHealthy;
        this.isCurrentlyHealthy = false;
        
        if (wasHealthy && config.onHealthChange) {
          config.onHealthChange(false);
        }
        
        if (config.onError) {
          config.onError(error as Error);
        }
      }
    }, config.interval);
  }

  /**
   * Stop health monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
  }

  /**
   * Get the last known health status
   */
  getLastHealthStatus(): HealthStatus | undefined {
    return this.lastHealthStatus;
  }

  /**
   * Check if the API is currently considered healthy
   */
  isHealthy(): boolean {
    return this.isCurrentlyHealthy;
  }

  /**
   * Test connectivity to the API
   */
  async testConnectivity(): Promise<boolean> {
    try {
      await this.checkHealth();
      return true;
    } catch (error) {
      // Log connection error details for debugging
      const errorDetails = analyzeConnectionError(error);
      console.warn('API connectivity test failed:', errorDetails);
      return false;
    }
  }

  /**
   * Check if the API is completely unavailable
   */
  async isApiUnavailable(): Promise<boolean> {
    try {
      await this.checkHealth();
      return false;
    } catch (error) {
      return isApiUnavailable(error);
    }
  }

  /**
   * Get detailed health information with component status
   */
  async getDetailedHealth(): Promise<{
    overall: boolean;
    components: {
      api: boolean;
      database: boolean;
      redis: boolean;
    };
    metadata: {
      version: string;
      uptime: number;
      responseTime: number;
    };
  }> {
    try {
      const result = await this.performHealthCheck();
      const status = result.status;
      
      return {
        overall: result.isHealthy,
        components: {
          api: result.isHealthy,
          database: status.database === 'healthy' || status.database === 'connected',
          redis: status.redis === 'healthy' || status.redis === 'connected'
        },
        metadata: {
          version: status.version,
          uptime: status.uptime,
          responseTime: result.responseTime
        }
      };
    } catch (error) {
      return {
        overall: false,
        components: {
          api: false,
          database: false,
          redis: false
        },
        metadata: {
          version: 'unknown',
          uptime: 0,
          responseTime: 0
        }
      };
    }
  }

  /**
   * Check if the API is ready to accept new jobs
   */
  async isReadyForJobs(): Promise<boolean> {
    try {
      const health = await this.getDetailedHealth();
      return health.overall && health.components.database && health.components.redis;
    } catch {
      return false;
    }
  }

  /**
   * Evaluate if a health status indicates a healthy system
   */
  private evaluateHealthStatus(status: HealthStatus): boolean {
    // Check overall status
    if (status.status !== 'healthy' && status.status !== 'ok') {
      return false;
    }

    // Check database connectivity
    if (status.database && 
        status.database !== 'healthy' && 
        status.database !== 'connected' && 
        status.database !== 'ok') {
      return false;
    }

    // Check Redis connectivity
    if (status.redis && 
        status.redis !== 'healthy' && 
        status.redis !== 'connected' && 
        status.redis !== 'ok') {
      return false;
    }

    return true;
  }
}

export const healthService = new HealthService();