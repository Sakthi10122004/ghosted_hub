import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('reviews')
@Controller('reviews')
@ApiBearerAuth()
@UseGuards(RolesGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZER)
  @ApiOperation({ summary: 'Get all reviews' })
  findAll() {
    return this.reviewsService.findAll();
  }
}
