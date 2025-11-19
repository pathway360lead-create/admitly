export interface ComparisonTrayProps {
  /**
   * Optional CSS class name
   */
  className?: string;

  /**
   * Callback when navigating to comparison page
   * If not provided, default navigation will be used
   */
  onNavigateToCompare?: (itemIds: string[]) => void;
}
