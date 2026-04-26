import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateJobDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  companyName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  jobTitle?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  status?: string;

  @IsOptional()
  @IsDateString()
  appliedDate?: string;
}
