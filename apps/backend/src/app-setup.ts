import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { SerializeInterceptor } from './common/interceptors/serialize.interceptor';

export function setupApp(app: INestApplication) {
    // Security headers with Helmet
    app.use(helmet({
        contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
        crossOriginResourcePolicy: { policy: "cross-origin" },
    }));

    // Rate limiting - 100 requests per minute per IP
    app.use(
        rateLimit({
            windowMs: 60 * 1000, // 1 minute
            max: 100, // limit each IP to 100 requests per windowMs
            message: 'Too many requests from this IP, please try again later.',
            standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
            legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        }),
    );

    // Enable CORS for frontend connection
    app.enableCors({
        origin: (origin, callback) => {
            const allowedOrigins = [
                'http://localhost:3000',
                'https://nest-assets-web.vercel.app',
                ...(process.env.CORS_ORIGIN?.split(',') || [])
            ];

            if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });

    // Global validation pipe with custom configuration
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, // Strip properties that don't have decorators
            forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
            transform: true, // Automatically transform payloads to DTO instances
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    // Global exception filter
    app.useGlobalFilters(new GlobalExceptionFilter());

    // Global serialization interceptor to exclude sensitive data
    app.useGlobalInterceptors(new SerializeInterceptor());

    // Set global prefix for all routes
    app.setGlobalPrefix(process.env.API_PREFIX || 'api');

    // Configure Swagger documentation
    const config = new DocumentBuilder()
        .setTitle('Real Estate Management API')
        .setDescription('Complete backend API for real estate management platform')
        .setVersion('1.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'JWT',
                description: 'Enter JWT token',
                in: 'header',
            },
            'JWT-auth',
        )
        .addTag('Authentication', 'Authentication and authorization endpoints')
        .addTag('Agents', 'Agent management endpoints')
        .addTag('Properties', 'Property management endpoints')
        .addTag('Leads', 'Lead and CRM management endpoints')
        .addTag('Media', 'File upload and media management endpoints')
        .addTag('Dashboard', 'Analytics and dashboard endpoints')
        .addTag('Admin', 'Admin panel endpoints')
        .addTag('Health', 'Health check and monitoring endpoints')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
}
