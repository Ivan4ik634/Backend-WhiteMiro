import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrectUser } from 'src/common/decorators/userCurrect.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create')
  @UseGuards(AuthGuard)
  async createPaymentIntent(@CurrectUser() userId: string, @Body() body: { amount: number }) {
    return this.paymentService.createCheckoutSession(body.amount, userId);
  }
  @Post('success')
  @UseGuards(AuthGuard)
  async successPayment(@CurrectUser() userId: string, @Body() body: { paymentId: string }) {
    return this.paymentService.successPayment(body, userId);
  }
  @Post('cancel')
  @UseGuards(AuthGuard)
  async cancelPayment(@CurrectUser() userId: string, @Body() body: { paymentId: string }) {
    return this.paymentService.cancelPayment(body.paymentId, userId);
  }
}
