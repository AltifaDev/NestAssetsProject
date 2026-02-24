import { IsString, IsNumber, IsEnum, IsOptional, Min, MinLength, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePropertyDto {
  @ApiProperty({
    description: 'Property title',
    example: 'Modern 2-Bedroom Condo in City Center',
    minLength: 5,
  })
  @IsString()
  @MinLength(5, { message: 'Title must be at least 5 characters long' })
  title: string;

  @ApiProperty({
    description: 'Detailed property description',
    example: 'Beautiful modern condo with stunning city views, fully furnished with premium appliances.',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Property price in THB',
    example: 3500000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'Price must be greater than or equal to 0' })
  price: number;

  @ApiProperty({
    description: 'Type of property',
    enum: ['house', 'condo', 'land', 'commercial'],
    example: 'condo',
  })
  @IsEnum(['house', 'condo', 'land', 'commercial'], {
    message: 'Property type must be one of: house, condo, land, commercial',
  })
  property_type: string;

  @ApiProperty({
    description: 'Property location',
    example: 'Sukhumvit, Bangkok',
  })
  @IsString()
  location: string;

  @ApiProperty({
    description: 'Number of bedrooms',
    example: 2,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0, { message: 'Bedrooms must be greater than or equal to 0' })
  bedrooms?: number;

  @ApiProperty({
    description: 'Number of bathrooms',
    example: 2,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0, { message: 'Bathrooms must be greater than or equal to 0' })
  bathrooms?: number;

  @ApiProperty({
    description: 'Property area in square meters',
    example: 65.5,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Area must be greater than or equal to 0' })
  area?: number;
}
