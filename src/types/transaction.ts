export interface TransactionQueryByTransactionIdData {
  tran_id: string
}

export interface TransactionQueryBySessionIdData {
  sessionkey: string
}

export interface TransactionQueryResponse {
  status: string
  error: string
  tran_id: string
  amount: string
  currency_type: string
  currency_amount: string
  currency_rate: string
  base_fair: string
  value_a: string
  value_b: string
  value_c: string
  value_d: string
  bank_tran_id: string
  card_type: string
  card_no: string
  card_issuer: string
  card_brand: string
  card_issuer_country: string
  card_issuer_country_code: string
  card_issuer_country_code_2: string
  card_issuer_country_2: string
  card_number: string
  card_expiry: string
  card_cvv: string
  card_holder_name: string
  card_type_2: string
  card_issuer_2: string
  card_brand_2: string
  currency_type_2: string
  currency_amount_2: string
  currency_rate_2: string
  base_fair_2: string
  value_a_2: string
  value_b_2: string
  value_c_2: string
  value_d_2: string
  risk_level: string
  risk_title: string
  token: string
  token_key: string
  token_gen_date: string
  token_expiry: string
  bin_number: string
  bin_country: string
  bin_country_code: string
  bin_issuer: string
  bin_brand: string
  bin_type: string
  bin_level: string
  card_sub_brand: string
  card_sub_type: string
  validated: string
  [key: string]: string | undefined
}
