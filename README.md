# SSLCommerz SDK - Usage Guide

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [ExpressJS Integration](#expressjs-integration)
  - [Project Structure](#express-project-structure)
  - [Environment Setup](#environment-setup)
  - [Controller](#controller)
  - [Routes](#routes)
  - [Complete Working Example](#complete-express-example)
- [NestJS Integration](#nestjs-integration)
  - [Project Structure](#nestjs-project-structure)
  - [Module Setup](#module-setup)
  - [Service](#service)
  - [Controller](#controller-nest)
  - [DTO Validation](#dto-validation)
  - [Custom Interceptor](#custom-interceptor)
  - [Complete Working Example](#complete-nestjs-example)
- [API Reference](#api-reference)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

---

## Installation

```bash
npm install sslcommerz-sdk-ts
```

## Quick Start

```typescript
import SSLCommerzPayment from 'sslcommerz-sdk-ts'

const sslcz = new SSLCommerzPayment(
  'your_store_id',
  'your_store_password',
  false, // sandbox mode
)

// Initialize a payment
const result = await sslcz.init({
  total_amount: 100,
  currency: 'BDT',
  tran_id: `TXN_${Date.now()}`,
  success_url: 'http://localhost:3030/success',
  fail_url: 'http://localhost:3030/fail',
  cancel_url: 'http://localhost:3030/cancel',
  shipping_method: 'Courier',
  product_name: 'Test Product',
  product_category: 'Electronic',
  product_profile: 'general',
  cus_name: 'Customer Name',
  cus_email: 'customer@example.com',
  cus_add1: 'Dhaka',
  cus_city: 'Dhaka',
  cus_postcode: '1000',
  cus_country: 'Bangladesh',
  cus_phone: '01711111111',
})

// Redirect user to GatewayPageURL
console.log(result.GatewayPageURL)
```

---

## ExpressJS Integration

### Express Project Structure

```
src/
├── config/
│   └── sslcommerz.config.ts
├── controllers/
│   └── payment.controller.ts
├── services/
│   └── payment.service.ts
├── routes/
│   └── payment.routes.ts
├── middleware/
│   └── error-handler.middleware.ts
├── types/
│   └── payment.types.ts
├── utils/
│   └── tran-id.util.ts
├── app.ts
└── server.ts
```

### Environment Setup

```env
# .env
PORT=3030
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_IS_LIVE=false
```

```typescript
// config/sslcommerz.config.ts
import SSLCommerzPayment from 'sslcommerz-sdk-ts'

const store_id = process.env.SSLCOMMERZ_STORE_ID!
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD!
const is_live = process.env.SSLCOMMERZ_IS_LIVE === 'true'

export const sslcz = new SSLCommerzPayment(store_id, store_passwd, isLive)
```

### Controller

```typescript
// controllers/payment.controller.ts
import { Router, Request, Response, NextFunction } from 'express'
import { body, query, validationResult } from 'express-validator'
import { sslcz } from '../config/sslcommerz.config'
import { generateTranId } from '../utils/tran-id.util'
import { catchAsync } from '../utils/catch-async.util'
import type { PaymentInitData } from 'sslcommerz-sdk-ts'

const router = Router()

const initValidation = [
  body('total_amount').isFloat({ gt: 0 }).withMessage('total_amount must be positive'),
  body('currency').isString().notEmpty().withMessage('currency is required'),
  body('cus_name').isString().notEmpty().withMessage('cus_name is required'),
  body('cus_email').isEmail().withMessage('cus_email must be valid'),
  body('cus_phone').isString().notEmpty().withMessage('cus_phone is required'),
  body('success_url').isURL().withMessage('success_url must be a valid URL'),
  body('fail_url').isURL().withMessage('fail_url must be a valid URL'),
  body('cancel_url').isURL().withMessage('cancel_url must be a valid URL'),
]

router.post(
  '/init',
  initValidation,
  catchAsync(async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const data: PaymentInitData = {
      total_amount: req.body.total_amount,
      currency: req.body.currency,
      tran_id: generateTranId(),
      success_url: req.body.success_url,
      fail_url: req.body.fail_url,
      cancel_url: req.body.cancel_url,
      ipn_url: req.body.ipn_url,
      shipping_method: req.body.shipping_method || 'Courier',
      product_name: req.body.product_name || 'Test Product',
      product_category: req.body.product_category || 'Electronic',
      product_profile: req.body.product_profile || 'general',
      cus_name: req.body.cus_name,
      cus_email: req.body.cus_email,
      cus_add1: req.body.cus_add1 || '',
      cus_add2: req.body.cus_add2 || '',
      cus_city: req.body.cus_city || '',
      cus_state: req.body.cus_state || '',
      cus_postcode: req.body.cus_postcode || '',
      cus_country: req.body.cus_country || 'Bangladesh',
      cus_phone: req.body.cus_phone,
      cus_fax: req.body.cus_fax || '',
      ship_name: req.body.ship_name || '',
      ship_add1: req.body.ship_add1 || '',
      ship_add2: req.body.ship_add2 || '',
      ship_city: req.body.ship_city || '',
      ship_state: req.body.ship_state || '',
      ship_postcode: req.body.ship_postcode || '',
      ship_country: req.body.ship_country || '',
    }

    const result = await sslcz.init(data)
    res.json({
      success: true,
      data: {
        GatewayPageURL: result.GatewayPageURL,
        status: result.status,
      },
    })
  }),
)

router.get(
  '/validate',
  [query('val_id').notEmpty().withMessage('val_id is required')],
  catchAsync(async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const result = await sslcz.validate({ val_id: req.query.val_id as string })
    res.json({ success: true, data: result })
  }),
)

router.post(
  '/success',
  catchAsync(async (req: Request, res: Response) => {
    const { val_id } = req.body
    if (!val_id) {
      return res.status(400).json({ success: false, message: 'val_id is required' })
    }

    const result = await sslcz.validate({ val_id })

    if (result.status === 'VALID') {
      // TODO: Update order status in database
      // TODO: Send confirmation email
      return res.json({ success: true, data: result })
    }

    return res.status(400).json({ success: false, message: 'Payment validation failed', data: result })
  }),
)

router.post('/fail', (req: Request, res: Response) => {
  // TODO: Log failed transaction in database
  res.json({ success: true, status: 'failed' })
})

router.post('/cancel', (req: Request, res: Response) => {
  // TODO: Log cancelled transaction in database
  res.json({ success: true, status: 'cancelled' })
})

router.post(
  '/ipn',
  catchAsync(async (req: Request, res: Response) => {
    const { val_id } = req.body

    if (val_id) {
      const result = await sslcz.validate({ val_id })

      if (result.status === 'VALID') {
        // TODO: Update order status in database
        // TODO: Trigger fulfillment workflow
      }
    }

    res.sendStatus(200)
  }),
)

router.post(
  '/refund/initiate',
  [
    body('bank_tran_id').notEmpty().withMessage('bank_tran_id is required'),
    body('refe_id').notEmpty().withMessage('refe_id is required'),
    body('refund_amount').isFloat({ gt: 0 }).withMessage('refund_amount must be positive'),
  ],
  catchAsync(async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const result = await sslcz.initiateRefund({
      refund_amount: req.body.refund_amount,
      refund_remarks: req.body.refund_remarks || '',
      bank_tran_id: req.body.bank_tran_id,
      refe_id: req.body.refe_id,
    })

    res.json({ success: true, data: result })
  }),
)

router.get(
  '/refund/query',
  [query('refund_ref_id').notEmpty().withMessage('refund_ref_id is required')],
  catchAsync(async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const result = await sslcz.refundQuery({ refund_ref_id: req.query.refund_ref_id as string })
    res.json({ success: true, data: result })
  }),
)

router.get(
  '/transaction/query-by-tran-id',
  [query('tran_id').notEmpty().withMessage('tran_id is required')],
  catchAsync(async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const result = await sslcz.transactionQueryByTransactionId({ tran_id: req.query.tran_id as string })
    res.json({ success: true, data: result })
  }),
)

router.get(
  '/transaction/query-by-session-id',
  [query('sessionkey').notEmpty().withMessage('sessionkey is required')],
  catchAsync(async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const result = await sslcz.transactionQueryBySessionId({ sessionkey: req.query.sessionkey as string })
    res.json({ success: true, data: result })
  }),
)

export default router
```

### Utility Files

```typescript
// utils/tran-id.util.ts
export function generateTranId(): string {
  return `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`
}
```

```typescript
// utils/catch-async.util.ts
import { Request, Response, NextFunction, RequestHandler } from 'express'

export function catchAsync(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next)
  }
}
```

```typescript
// middleware/error-handler.middleware.ts
import { Request, Response, NextFunction } from 'express'
import { SSLCommerzError, ValidationError, NetworkError, APIError } from 'sslcommerz-sdk-ts'

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: err.message,
    })
  }

  if (err instanceof NetworkError) {
    return res.status(502).json({
      success: false,
      error: 'Network Error',
      message: err.message,
    })
  }

  if (err instanceof APIError) {
    return res.status(502).json({
      success: false,
      error: 'SSLCommerz API Error',
      message: err.message,
    })
  }

  if (err instanceof SSLCommerzError) {
    return res.status(500).json({
      success: false,
      error: 'SSLCommerz Error',
      message: err.message,
    })
  }

  console.error('Unexpected error:', err)
  return res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
  })
}
```

### App and Server

```typescript
// app.ts
import express from 'express'
import dotenv from 'dotenv'
import paymentRoutes from './routes/payment.routes'
import { errorHandler } from './middleware/error-handler.middleware'

dotenv.config()

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/payment', paymentRoutes)

app.use(errorHandler)

export default app
```

```typescript
// server.ts
import app from './app'

const PORT = process.env.PORT || 3030

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
```

### Complete Express Example

```typescript
// server.ts - Minimal complete example
import express from 'express'
import SSLCommerzPayment from 'sslcommerz-sdk-ts'

const app = express()
app.use(express.json())

const sslcz = new SSLCommerzPayment(
  process.env.SSLCOMMERZ_STORE_ID!,
  process.env.SSLCOMMERZ_STORE_PASSWORD!,
  process.env.SSLCOMMERZ_IS_LIVE === 'true',
)

app.post('/init', async (req, res) => {
  try {
    const result = await sslcz.init({
      total_amount: req.body.total_amount,
      currency: 'BDT',
      tran_id: `TXN_${Date.now()}`,
      success_url: 'http://localhost:3030/success',
      fail_url: 'http://localhost:3030/fail',
      cancel_url: 'http://localhost:3030/cancel',
      shipping_method: 'Courier',
      product_name: 'Test Product',
      product_category: 'Electronic',
      product_profile: 'general',
      cus_name: req.body.cus_name,
      cus_email: req.body.cus_email,
      cus_add1: req.body.cus_add1 || 'Dhaka',
      cus_city: req.body.cus_city || 'Dhaka',
      cus_postcode: req.body.cus_postcode || '1000',
      cus_country: 'Bangladesh',
      cus_phone: req.body.cus_phone,
    })

    res.json({ GatewayPageURL: result.GatewayPageURL })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

app.get('/validate', async (req, res) => {
  try {
    const result = await sslcz.validate({ val_id: req.query.val_id as string })
    res.json(result)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

app.post('/success', async (req, res) => {
  const result = await sslcz.validate({ val_id: req.body.val_id })
  if (result.status === 'VALID') {
    // Update order in database
    res.json({ status: 'success', data: result })
  } else {
    res.status(400).json({ status: 'invalid' })
  }
})

app.post('/fail', (req, res) => res.json({ status: 'failed' }))
app.post('/cancel', (req, res) => res.json({ status: 'cancelled' }))

app.listen(3030, () => console.log('Server running at http://localhost:3030'))
```

---

## NestJS Integration

### NestJS Project Structure

```
src/
├── sslcommerz/
│   ├── dto/
│   │   ├── init-payment.dto.ts
│   │   ├── validate-payment.dto.ts
│   │   ├── initiate-refund.dto.ts
│   │   └── transaction-query.dto.ts
│   ├── interceptors/
│   │   └── sslcommerz-error.interceptor.ts
│   ├── sslcommerz.module.ts
│   ├── sslcommerz.service.ts
│   └── sslcommerz.controller.ts
├── app.module.ts
└── main.ts
```

### Module Setup

```typescript
// sslcommerz/sslcommerz.module.ts
import { Module } from '@nestjs/common'
import { SSLCommerzService } from './sslcommerz.service'
import { SSLCommerzController } from './sslcommerz.controller'

@Module({
  controllers: [SSLCommerzController],
  providers: [SSLCommerzService],
  exports: [SSLCommerzService],
})
export class SSLCommerzModule {}
```

```typescript
// app.module.ts
import { Module } from '@nestjs/common'
import { SSLCommerzModule } from './sslcommerz/sslcommerz.module'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), SSLCommerzModule],
})
export class AppModule {}
```

```typescript
// main.ts
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  await app.listen(process.env.PORT || 3030)
}
bootstrap()
```

### Service

```typescript
// sslcommerz/sslcommerz.service.ts
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import SSLCommerzPayment, {
  PaymentInitData,
  ValidateData,
  RefundData,
  RefundQueryData,
  TransactionQueryByTransactionIdData,
  TransactionQueryBySessionIdData,
} from 'sslcommerz-sdk-ts'

@Injectable()
export class SSLCommerzService {
  private readonly logger = new Logger(SSLCommerzService.name)
  private readonly sslcz: SSLCommerzPayment

  constructor(private readonly configService: ConfigService) {
    const storeId = this.configService.getOrThrow<string>('SSLCOMMERZ_STORE_ID')
    const storePassword = this.configService.getOrThrow<string>('SSLCOMMERZ_STORE_PASSWORD')
    const isLive = this.configService.get<string>('SSLCOMMERZ_IS_LIVE') === 'true'

    this.sslcz = new SSLCommerzPayment(storeId, storePassword, isLive)
    this.logger.log(`SSLCommerz initialized in ${isLive ? 'LIVE' : 'SANDBOX'} mode`)
  }

  async initPayment(data: PaymentInitData) {
    this.logger.log(`Initializing payment for tran_id: ${data.tran_id}`)
    const result = await this.sslcz.init(data)
    this.logger.log(`Payment initialized: ${result.status}`)
    return result
  }

  async validatePayment(data: ValidateData) {
    this.logger.log(`Validating payment: ${data.val_id}`)
    const result = await this.sslcz.validate(data)
    this.logger.log(`Validation result: ${result.status}`)
    return result
  }

  async initiateRefund(data: RefundData) {
    this.logger.log(`Initiating refund for bank_tran_id: ${data.bank_tran_id}`)
    const result = await this.sslcz.initiateRefund(data)
    this.logger.log(`Refund initiated: ${result.status}`)
    return result
  }

  async refundQuery(data: RefundQueryData) {
    this.logger.log(`Querying refund: ${data.refund_ref_id}`)
    return this.sslcz.refundQuery(data)
  }

  async transactionQueryByTransactionId(data: TransactionQueryByTransactionIdData) {
    this.logger.log(`Querying transaction: ${data.tran_id}`)
    return this.sslcz.transactionQueryByTransactionId(data)
  }

  async transactionQueryBySessionId(data: TransactionQueryBySessionIdData) {
    this.logger.log(`Querying session: ${data.sessionkey}`)
    return this.sslcz.transactionQueryBySessionId(data)
  }
}
```

### DTO Validation

```typescript
// sslcommerz/dto/init-payment.dto.ts
import {
  IsString,
  IsNumber,
  IsEmail,
  IsOptional,
  IsUrl,
  Min,
  IsNotEmpty,
} from 'class-validator'
import { Type } from 'class-transformer'

export class InitPaymentDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  total_amount: number

  @IsString()
  @IsNotEmpty()
  currency: string

  @IsOptional()
  @IsString()
  tran_id?: string

  @IsUrl()
  success_url: string

  @IsUrl()
  fail_url: string

  @IsUrl()
  cancel_url: string

  @IsOptional()
  @IsUrl()
  ipn_url?: string

  @IsString()
  @IsNotEmpty()
  shipping_method: string

  @IsString()
  @IsNotEmpty()
  product_name: string

  @IsString()
  @IsNotEmpty()
  product_category: string

  @IsString()
  @IsNotEmpty()
  product_profile: string

  @IsString()
  @IsNotEmpty()
  cus_name: string

  @IsEmail()
  cus_email: string

  @IsOptional()
  @IsString()
  cus_add1?: string

  @IsOptional()
  @IsString()
  cus_add2?: string

  @IsOptional()
  @IsString()
  cus_city?: string

  @IsOptional()
  @IsString()
  cus_state?: string

  @IsOptional()
  @IsString()
  cus_postcode?: string

  @IsOptional()
  @IsString()
  cus_country?: string

  @IsString()
  @IsNotEmpty()
  cus_phone: string

  @IsOptional()
  @IsString()
  cus_fax?: string

  @IsOptional()
  @IsString()
  ship_name?: string

  @IsOptional()
  @IsString()
  ship_add1?: string

  @IsOptional()
  @IsString()
  ship_add2?: string

  @IsOptional()
  @IsString()
  ship_city?: string

  @IsOptional()
  @IsString()
  ship_state?: string

  @IsOptional()
  @IsString()
  ship_postcode?: string

  @IsOptional()
  @IsString()
  ship_country?: string

  @IsOptional()
  @IsString()
  multi_card_name?: string

  @IsOptional()
  @IsString()
  allowed_bin?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  emi_option?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  emi_max_inst_option?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  emi_selected_inst?: number
}
```

```typescript
// sslcommerz/dto/validate-payment.dto.ts
import { IsString, IsNotEmpty } from 'class-validator'

export class ValidatePaymentDto {
  @IsString()
  @IsNotEmpty()
  val_id: string
}
```

```typescript
// sslcommerz/dto/initiate-refund.dto.ts
import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class InitiateRefundDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  refund_amount: number

  @IsString()
  refund_remarks: string

  @IsString()
  @IsNotEmpty()
  bank_tran_id: string

  @IsString()
  @IsNotEmpty()
  refe_id: string
}
```

```typescript
// sslcommerz/dto/refund-query.dto.ts
import { IsString, IsNotEmpty } from 'class-validator'

export class RefundQueryDto {
  @IsString()
  @IsNotEmpty()
  refund_ref_id: string
}
```

```typescript
// sslcommerz/dto/transaction-query.dto.ts
import { IsString, IsNotEmpty } from 'class-validator'

export class TransactionQueryByTransactionIdDto {
  @IsString()
  @IsNotEmpty()
  tran_id: string
}

export class TransactionQueryBySessionIdDto {
  @IsString()
  @IsNotEmpty()
  sessionkey: string
}
```

### Custom Interceptor

```typescript
// sslcommerz/interceptors/sslcommerz-error.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common'
import { Observable, catchError, throwError } from 'rxjs'
import { SSLCommerzError, ValidationError, NetworkError, APIError } from 'sslcommerz-sdk-ts'

@Injectable()
export class SSLCommerzErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof ValidationError) {
          return throwError(
            () =>
              new HttpException(
                {
                  statusCode: HttpStatus.BAD_REQUEST,
                  error: 'Validation Error',
                  message: error.message,
                },
                HttpStatus.BAD_REQUEST,
              ),
          )
        }

        if (error instanceof NetworkError) {
          return throwError(
            () =>
              new HttpException(
                {
                  statusCode: HttpStatus.BAD_GATEWAY,
                  error: 'Network Error',
                  message: error.message,
                },
                HttpStatus.BAD_GATEWAY,
              ),
          )
        }

        if (error instanceof APIError) {
          return throwError(
            () =>
              new HttpException(
                {
                  statusCode: HttpStatus.BAD_GATEWAY,
                  error: 'SSLCommerz API Error',
                  message: error.message,
                },
                HttpStatus.BAD_GATEWAY,
              ),
          )
        }

        if (error instanceof SSLCommerzError) {
          return throwError(
            () =>
              new HttpException(
                {
                  statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                  error: 'SSLCommerz Error',
                  message: error.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
              ),
          )
        }

        return throwError(() => error)
      }),
    )
  }
}
```

### Controller (Nest)

```typescript
// sslcommerz/sslcommerz.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { SSLCommerzService } from './sslcommerz.service'
import { SSLCommerzErrorInterceptor } from './interceptors/sslcommerz-error.interceptor'
import { InitPaymentDto } from './dto/init-payment.dto'
import { ValidatePaymentDto } from './dto/validate-payment.dto'
import { InitiateRefundDto } from './dto/initiate-refund.dto'
import { RefundQueryDto } from './dto/refund-query.dto'
import { TransactionQueryByTransactionIdDto, TransactionQueryBySessionIdDto } from './dto/transaction-query.dto'

@Controller('sslcommerz')
@UseInterceptors(SSLCommerzErrorInterceptor)
export class SSLCommerzController {
  constructor(private readonly sslcommerzService: SSLCommerzService) {}

  @Post('init')
  @HttpCode(HttpStatus.OK)
  async init(@Body() data: InitPaymentDto) {
    const tran_id = data.tran_id || `TXN_${Date.now()}`
    return this.sslcommerzService.initPayment({ ...data, tran_id })
  }

  @Get('validate')
  async validate(@Query() data: ValidatePaymentDto) {
    return this.sslcommerzService.validatePayment(data)
  }

  @Post('success')
  @HttpCode(HttpStatus.OK)
  async success(@Body() data: ValidatePaymentDto) {
    const result = await this.sslcommerzService.validatePayment(data)
    if (result.status !== 'VALID') {
      return { success: false, message: 'Payment validation failed', data: result }
    }
    // TODO: Update order status in database
    return { success: true, data: result }
  }

  @Post('fail')
  @HttpCode(HttpStatus.OK)
  async fail() {
    // TODO: Log failed transaction
    return { success: true, status: 'failed' }
  }

  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  async cancel() {
    // TODO: Log cancelled transaction
    return { success: true, status: 'cancelled' }
  }

  @Post('ipn')
  @HttpCode(HttpStatus.OK)
  async ipn(@Body() data: ValidatePaymentDto) {
    const result = await this.sslcommerzService.validatePayment(data)
    if (result.status === 'VALID') {
      // TODO: Update order status in database
      // TODO: Trigger fulfillment workflow
    }
    return { received: true }
  }

  @Post('refund/initiate')
  @HttpCode(HttpStatus.OK)
  async initiateRefund(@Body() data: InitiateRefundDto) {
    return this.sslcommerzService.initiateRefund(data)
  }

  @Get('refund/query')
  async refundQuery(@Query() data: RefundQueryDto) {
    return this.sslcommerzService.refundQuery(data)
  }

  @Get('transaction/query-by-tran-id')
  async transactionQueryByTransactionId(@Query() data: TransactionQueryByTransactionIdDto) {
    return this.sslcommerzService.transactionQueryByTransactionId(data)
  }

  @Get('transaction/query-by-session-id')
  async transactionQueryBySessionId(@Query() data: TransactionQueryBySessionIdDto) {
    return this.sslcommerzService.transactionQueryBySessionId(data)
  }
}
```

### Complete NestJS Example

```typescript
// main.ts - Minimal complete example
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

  const port = process.env.PORT || 3030
  await app.listen(port)
  console.log(`Server running at http://localhost:${port}`)
}
bootstrap()
```

```env
# .env
PORT=3030
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_IS_LIVE=false
```

---

## API Reference

### Constructor

```typescript
new SSLCommerzPayment(storeId: string, storePassword: string, isLive: boolean, config?: Partial<SSLCommerzConfig>)
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `storeId` | `string` | Yes | Your SSLCommerz store ID |
| `storePassword` | `string` | Yes | Your SSLCommerz store password |
| `isLive` | `boolean` | Yes | `true` for live, `false` for sandbox |
| `config` | `Partial<SSLCommerzConfig>` | No | Optional config overrides |

### Methods

#### `init(data: PaymentInitData): Promise<PaymentInitResponse>`

Initializes a payment transaction and returns a gateway URL.

**Required fields in `PaymentInitData`:**
- `total_amount` — Amount must be greater than 0
- `currency` — e.g., `'BDT'`
- `tran_id` — Unique transaction ID
- `success_url`, `fail_url`, `cancel_url` — Valid URLs
- `shipping_method`, `product_name`, `product_category`, `product_profile`
- `cus_name`, `cus_email` (valid email), `cus_phone`
- `cus_add1`, `cus_city`, `cus_postcode`, `cus_country`

#### `validate(data: { val_id: string }): Promise<ValidateResponse>`

Validates a transaction after payment completion.

#### `initiateRefund(data: RefundData): Promise<RefundResponse>`

Initiates a refund for a completed transaction.

**Required fields:**
- `refund_amount` — Must be greater than 0
- `refund_remarks`
- `bank_tran_id`
- `refe_id`

#### `refundQuery(data: { refund_ref_id: string }): Promise<RefundQueryResponse>`

Queries the status of a refund request.

#### `transactionQueryByTransactionId(data: { tran_id: string }): Promise<TransactionQueryResponse>`

Queries transaction status by transaction ID.

#### `transactionQueryBySessionId(data: { sessionkey: string }): Promise<TransactionQueryResponse>`

Queries transaction status by session ID.

---

## Error Handling

All methods throw typed errors from the `sslcommerz-sdk-ts` package:

| Error Class | When Thrown | HTTP Status |
|-------------|-------------|-------------|
| `ValidationError` | Invalid input data | 400 |
| `NetworkError` | HTTP request failed | 502 |
| `APIError` | SSLCommerz API returned error | 502 |
| `ConfigurationError` | Invalid constructor config | 500 |
| `SSLCommerzError` | Base class for all SDK errors | — |

```typescript
import { ValidationError, NetworkError, APIError, SSLCommerzError } from 'sslcommerz-sdk-ts'

try {
  const result = await sslcz.init(data)
} catch (error) {
  if (error instanceof ValidationError) {
    // Fix input data
  } else if (error instanceof NetworkError) {
    // Retry or check connectivity
  } else if (error instanceof APIError) {
    // Handle API-level failure
  } else if (error instanceof SSLCommerzError) {
    // Catch-all for SDK errors
  }
}
```

---

## Best Practices

1. **Always validate payment on server side** — Never trust client-side validation alone. Always call `validate()` in your `success_url` and `ipn_url` handlers.

2. **Use unique `tran_id`** — Generate a unique transaction ID for each payment attempt. Use a combination of timestamp and random string.

3. **Handle IPN for reliability** — IPN (Instant Payment Notification) is more reliable than success URL redirect. Always implement IPN handler.

4. **Store credentials securely** — Never hardcode store ID/password. Use environment variables.

5. **Use sandbox for testing** — Always test with `isLive: false` before going live.

6. **Implement idempotency** — Use the same `tran_id` for retry attempts to prevent duplicate charges.

7. **Log everything** — Log all API requests and responses for debugging and audit purposes.

8. **Set appropriate timeout** — The default timeout is 30 seconds. Adjust based on your needs via config override.

9. **Validate amounts server-side** — Never trust the amount sent from client. Always verify against your order total.

10. **Use HTTPS in production** — All callback URLs must use HTTPS in live mode.
