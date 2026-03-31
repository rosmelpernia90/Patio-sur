// ========================
// Core Types for Patio Sur
// ========================

export interface Project {
  id: string;
  name: string;
  code: string;
  description: string;
  client_name: string;
  start_date: string;
  estimated_end_date: string;
  actual_end_date: string | null;
  total_budget: number;
  currency: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  location: string | null;
  project_manager: string | null;
  time_progress_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface WBSItem {
  id: string;
  project_id: string;
  code: string;
  name: string;
  level: 'chapter' | 'sub_chapter' | 'work_package' | 'activity';
  parent_id: string | null;
  description: string | null;
  planned_start_date: string | null;
  planned_end_date: string | null;
  actual_start_date: string | null;
  actual_end_date: string | null;
  planned_progress: number;
  actual_progress: number;
  progress_deviation: number;
  is_behind_schedule: boolean;
  weight: number;
  status: string;
  sort_order: number;
}

export interface BudgetItem {
  id: string;
  project_id: string;
  wbs_item_id: string;
  code: string;
  description: string;
  category: string;
  cost_type: string;
  original_amount: number;
  approved_changes: number;
  current_budget: number;
  committed_amount: number;
  actual_amount: number;
  available_budget: number;
  cost_variance: number;
  cost_variance_percentage: number;
  budget_consumption_percentage: number;
  is_over_budget: boolean;
}

export interface Transaction {
  id: string;
  project_id: string;
  transaction_type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  net_amount: number;
  signed_amount: number;
  transaction_date: string;
  counterparty: string | null;
  status: string;
  due_date: string | null;
  is_overdue: boolean;
}

export interface Invoice {
  id: string;
  project_id: string;
  invoice_type: 'client' | 'supplier';
  invoice_number: string;
  counterparty_name: string;
  issue_date: string;
  due_date: string;
  status: string;
  gross_total: number;
  net_total: number;
  amount_paid: number;
  balance_due: number;
  is_overdue: boolean;
  days_until_due: number;
}

export interface CashFlowEntry {
  id: string;
  project_id: string;
  year: number;
  month: number;
  period_label: string;
  projected_income: number;
  projected_expense: number;
  projected_net: number;
  actual_income: number;
  actual_expense: number;
  actual_net: number;
  is_negative_cash_flow: boolean;
}

export interface BudgetSummary {
  total_original_budget: number;
  total_approved_changes: number;
  total_current_budget: number;
  total_committed: number;
  total_actual: number;
  total_available: number;
  consumption_percentage: number;
}

export interface DashboardData {
  project: Project;
  budget_summary: BudgetSummary;
  cash_flow_summary: {
    total_projected_income: number;
    total_projected_expense: number;
    total_actual_income: number;
    total_actual_expense: number;
    projected_net: number;
    actual_net: number;
  };
  counts: {
    recent_transactions: number;
    pending_invoices: number;
    overdue_invoices: number;
  };
  earned_value: {
    bac: number;
    actual_cost: number;
  };
}
