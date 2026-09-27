import type { PaymentInitData } from '../types'
import { ValidationError } from '../errors'

export function transformPaymentInitData(data: PaymentInitData): Record<string, string | number | undefined> {
  const transformed: Record<string, string | number | undefined> = {}

  transformed.store_id = data.store_id
  transformed.store_passwd = data.store_passwd
  transformed.productcategory = data.productcategory
  transformed.tran_id = data.tran_id
  transformed.total_amount = data.total_amount
  transformed.currency = data.currency
  transformed.success_url = data.success_url
  transformed.fail_url = data.fail_url
  transformed.cancel_url = data.cancel_url
  transformed.ipn_url = data.ipn_url
  transformed.multi_card_name = data.multi_card_name
  transformed.allowed_bin = data.allowed_bin
  transformed.emi_option = data.emi_option
  transformed.emi_max_inst_option = data.emi_max_inst_option
  transformed.emi_selected_inst = data.emi_selected_inst
  transformed.cus_name = data.cus_name
  transformed.cus_email = data.cus_email
  transformed.cus_add1 = data.cus_add1
  transformed.cus_add2 = data.cus_add2
  transformed.cus_city = data.cus_city
  transformed.cus_state = data.cus_state
  transformed.cus_postcode = data.cus_postcode
  transformed.cus_country = data.cus_country
  transformed.cus_phone = data.cus_phone
  transformed.cus_fax = data.cus_fax
  transformed.shipping_method = data.shipping_method
  transformed.num_of_item = data.num_of_item
  transformed.ship_name = data.ship_name
  transformed.ship_add1 = data.ship_add1
  transformed.ship_add2 = data.ship_add2
  transformed.ship_city = data.ship_city
  transformed.ship_state = data.ship_state
  transformed.ship_postcode = data.ship_postcode
  transformed.ship_country = data.ship_country
  transformed.product_name = data.product_name
  transformed.product_category = data.product_category
  transformed.product_profile = data.product_profile
  transformed.hours_till_departure = data.hours_till_departure
  transformed.flight_type = data.flight_type
  transformed.pnr = data.pnr
  transformed.journey_from_to = data.journey_from_to
  transformed.third_party_booking = data.third_party_booking?.toString()
  transformed.hotel_name = data.hotel_name
  transformed.length_of_stay = data.length_of_stay
  transformed.check_in_time = data.check_in_time
  transformed.hotel_city = data.hotel_city
  transformed.product_type = data.product_type
  transformed.topup_number = data.topup_number
  transformed.country_topup = data.country_topup
  transformed.cart = data.cart
  transformed.product_amount = data.product_amount
  transformed.discount_amount = data.discount_amount
  transformed.convenience_fee = data.convenience_fee
  transformed.value_a = data.value_a
  transformed.value_b = data.value_b
  transformed.value_c = data.value_c
  transformed.value_d = data.value_d

  return transformed
}

export function validatePaymentInitData(data: PaymentInitData): void {
  const requiredFields: (keyof PaymentInitData)[] = [
    'store_id',
    'store_passwd',
    'productcategory',
    'tran_id',
    'total_amount',
    'currency',
    'success_url',
    'fail_url',
    'cancel_url',
    'shipping_method',
    'product_name',
    'product_category',
    'product_profile',
    'cus_name',
    'cus_email',
    'cus_add1',
    'cus_city',
    'cus_postcode',
    'cus_country',
    'cus_phone',
  ]

  const missingFields = requiredFields.filter((field) => {
    const value = data[field]
    return value === undefined || value === null || value === ''
  })

  if (missingFields.length > 0) {
    throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`)
  }

  if (data.total_amount <= 0) {
    throw new ValidationError('total_amount must be greater than 0')
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.cus_email)) {
    throw new ValidationError('cus_email must be a valid email address')
  }

  const urlFields: (keyof PaymentInitData)[] = ['success_url', 'fail_url', 'cancel_url']
  for (const field of urlFields) {
    const value = data[field] as string
    if (value && !isValidUrl(value)) {
      throw new ValidationError(`${field} must be a valid URL`)
    }
  }
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
