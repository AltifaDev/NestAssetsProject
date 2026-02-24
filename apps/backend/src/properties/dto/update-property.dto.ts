import { IsString, IsNumber, IsEnum, IsOptional, Min, MinLength, IsInt } from 'class-validator';

export class UpdatePropertyDto {
  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'Title must be at least 5 characters long' })
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Price must be greater than or equal to 0' })
  price?: number;

  @IsOptional()
  @IsEnum(['house', 'condo', 'land', 'commercial'], {
    message: 'Property type must be one of: house, condo, land, commercial',
  })
  property_type?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'Bedrooms must be greater than or equal to 0' })
  bedrooms?: number;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'Bathrooms must be greater than or equal to 0' })
  bathrooms?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Area must be greater than or equal to 0' })
  area?: number;

  @IsOptional()
  @IsEnum(['active', 'sold', 'deleted'], {
    message: 'Status must be one of: active, sold, deleted',
  })
  status?: string;
}
