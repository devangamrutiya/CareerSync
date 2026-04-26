import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @MinLength(1)
  companyName!: string;

  @IsString()
  @MinLength(1)
  jobTitle!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  status?: string;

  @IsOptional()
  @IsDateString()
  appliedDate?: string;
}
