import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ValidDatePipe implements PipeTransform {
  transform(value: any) {
    if (!value) return;
    const date = new Date(value);
    if (isNaN(date.getTime()) || date > new Date()) {
      throw new BadRequestException('Invalid date');
    }
    return date;
  }
}