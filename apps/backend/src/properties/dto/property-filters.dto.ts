import { IsOptional, IsEnum, IsNumber, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PropertyFilters {
  @IsOptional()
  @IsEnum(['house', 'condo', 'land', 'commercial'], {
    message: 'Property type must be one of: house, condo, land, commercial',
  })
  property_type?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_price?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(['active', 'sold', 'deleted'], {
    message: 'Status must be one of: active, sold, deleted',
  })
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  bathrooms?: number;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsEnum(['relevance', 'created_at', 'price_asc', 'price_desc'], {
    message: 'Sort must be one of: relevance, created_at, price_asc, price_desc',
  })
  sort?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
