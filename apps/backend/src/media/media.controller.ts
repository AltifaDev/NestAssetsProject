import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MediaService } from './media.service';
import { UploadFileDto, UploadMultipleFilesDto } from './dto/upload-file.dto';

@ApiTags('media')
@ApiBearerAuth()
@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        related_to: {
          type: 'string',
          example: 'property',
        },
        related_id: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file type or size',
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
    @CurrentUser() user: any,
  ) {
    return this.mediaService.uploadFile(
      file,
      user.id,
      uploadFileDto.related_to,
      uploadFileDto.related_id,
    );
  }

  @Post('upload-multiple')
  @ApiOperation({ summary: 'Upload multiple files for a property' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        property_id: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        tags: {
          type: 'string',
          example: 'exterior,interior,kitchen',
        },
        captions: {
          type: 'string',
          example: 'Front view,Living room,Modern kitchen',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Files uploaded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file type or size',
  })
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadDto: UploadMultipleFilesDto,
    @CurrentUser() user: any,
  ) {
    const tags = uploadDto.tags ? uploadDto.tags.split(',').map((t) => t.trim()) : [];
    const captions = uploadDto.captions
      ? uploadDto.captions.split(',').map((c) => c.trim())
      : [];

    return this.mediaService.uploadMultipleFiles(
      files,
      user.id,
      uploadDto.property_id,
      tags,
      captions,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete media (soft delete)' })
  @ApiResponse({
    status: 204,
    description: 'Media deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Media not found',
  })
  async deleteMedia(@Param('id') id: string, @CurrentUser() user: any) {
    await this.mediaService.deleteMedia(id, user.id);
  }

  @Get(':id/url')
  @ApiOperation({ summary: 'Get media public URL' })
  @ApiResponse({
    status: 200,
    description: 'Media URL retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example: 'https://example.com/media/file.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Media not found',
  })
  async getMediaUrl(@Param('id') id: string) {
    const url = await this.mediaService.getMediaUrl(id);
    return { url };
  }
}
