export interface RefundData {
  refund_amount: number
  refund_remarks: string
  bank_tran_id: string
  refe_id: string
}

export interface RefundResponse {
  status: string
  error: string
  bank_tran_id: string
  tran_id: string
  refund_amount: string
  refund_remarks: string
  refund_ref_id: string
  refund_ref_id_status: string
  refund_ref_id_date: string
  [key: string]: string | undefined
}

export interface RefundQueryData {
  refund_ref_id: string
}

export interface RefundQueryResponse {
  status: string
  error: string
  bank_tran_id: string
  tran_id: string
  refund_amount: string
  refund_remarks: string
  refund_ref_id: string
  refund_ref_id_status: string
  refund_ref_id_date: string
  [key: string]: string | undefined
}
