import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiProperty({
    description: 'Related entity type (property or agent)',
    example: 'property',
    required: false,
  })
  @IsOptional()
  @IsString()
  related_to?: string;

  @ApiProperty({
    description: 'Related entity ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  related_id?: string;
}

export class UploadMultipleFilesDto {
  @ApiProperty({
    description: 'Property ID to associate images with',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  property_id: string;

  @ApiProperty({
    description: 'Tags for each image (comma-separated)',
    example: 'exterior,interior,kitchen',
    required: false,
  })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiProperty({
    description: 'Captions for each image (comma-separated)',
    example: 'Front view,Living room,Modern kitchen',
    required: false,
  })
  @IsOptional()
  @IsString()
  captions?: string;
}
