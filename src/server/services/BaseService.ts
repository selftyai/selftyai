import { Model } from '@/types/Model'

/**
 * Base class for all AI providers
 * such as Ollama, LM Studio, etc.
 */
export abstract class BaseService {
  protected baseURL: string = ''

  protected constructor() {}

  /**
   * Get the instance of the service. If the instance is not created, it will be created.
   * This method should be implemented in derived classes to ensure type safety.
   */
  static getInstance(): BaseService {
    throw new Error('getInstance method must be implemented in derived class')
  }

  /**
   * Verify the connection to the service
   * @param _url {string} The base URL for the service. If not provided, the base URL set in the service will be used.
   * @returns {Promise<boolean>} True if the connection is successful, false otherwise
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  verifyConnection(_url?: string): Promise<boolean> {
    throw new Error('verifyConnection method must be implemented in derived class')
  }

  /**
   * Get the models available for the service
   * @returns {Promise<Model[]>} The models available for the service
   */
  getModels(): Promise<Model[]> {
    throw new Error('getModels method must be implemented in derived class')
  }

  /**
   * Set the base URL for the service
   * @param baseURL {string} The base URL for the service
   */
  setBaseURL(baseURL: string): void {
    this.baseURL = baseURL
  }

  /**
   * Get the base URL for the service
   * @returns {string} The base URL for the service
   */
  getBaseURL(): string {
    return this.baseURL
  }
}
