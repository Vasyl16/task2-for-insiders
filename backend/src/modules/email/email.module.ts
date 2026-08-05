import { Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';

/**
 * Infrastructure module wrapping the Resend client. Global so any feature
 * module can inject EmailService without importing this module explicitly.
 */
@Global()
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
