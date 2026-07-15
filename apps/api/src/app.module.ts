import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD } from '@nestjs/core';

import { ErrorsModule } from './core/errors/errors.module';
import { HealthModule } from './core/health/health.module';
import { AuthModule } from './core/auth/auth.module';
import { TenancyModule } from './core/tenancy/tenancy.module';
import { AuditModule } from './core/audit/audit.module';
import { EventsModule } from './core/events/events.module';
import { JobsModule } from './core/jobs/jobs.module';
import { ParametersModule } from './core/parameters/parameters.module';
import { NotificationsModule } from './core/notifications/notifications.module';
import { ObservabilityModule } from './core/observability/observability.module';

import { OrganizationsModule } from './modules/organizations/organizations.module';
import { UsersModule } from './modules/users/users.module';
import { CrmModule } from './modules/crm/crm.module';
import { ClientsModule } from './modules/clients/clients.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { ProductionModule } from './modules/production/production.module';
import { DesignBudgetModule } from './modules/design-budget/design-budget.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { MeetingsModule } from './modules/meetings/meetings.module';
import { ContentModule } from './modules/content/content.module';
import { ReportsModule } from './modules/reports/reports.module';
import { BillingModule } from './modules/billing/billing.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { BriefsModule } from './modules/briefs/briefs.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { DashboardsModule } from './modules/dashboards/dashboards.module';
import { MetaModule } from './modules/integrations/meta/meta.module';
import { OAuthModule } from './modules/integrations/oauth/oauth.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { UploadsModule } from './modules/uploads/uploads.module';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USERNAME = process.env.DB_USERNAME || 'vitahub';
const DB_PASSWORD = process.env.DB_PASSWORD || 'vitahub_secret';
const DB_DATABASE = process.env.DB_DATABASE || 'vitahub';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: DB_HOST,
      port: DB_PORT,
      username: DB_USERNAME,
      password: DB_PASSWORD,
      database: DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/infrastructure/migrations/*{.ts,.js}'],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
      extra: { charset: 'utf8mb4_unicode_ci' },
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    EventEmitterModule.forRoot(),
    ErrorsModule,
    HealthModule,
    AuthModule,
    TenancyModule,
    AuditModule,
    EventsModule,
    JobsModule,
    ParametersModule,
    NotificationsModule,
    ObservabilityModule,
    OrganizationsModule,
    UsersModule,
    CrmModule,
    ClientsModule,
    ContractsModule,
    CatalogModule,
    ProductionModule,
    DesignBudgetModule,
    GamificationModule,
    IntegrationsModule,
    MeetingsModule,
    ContentModule,
    ReportsModule,
    BillingModule,
    ApprovalsModule,
    OnboardingModule,
    BriefsModule,
    DocumentsModule,
    DashboardsModule,
    MetaModule,
    OAuthModule,
    KnowledgeModule,
    UploadsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
