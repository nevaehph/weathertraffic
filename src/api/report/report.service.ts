import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportService {
  async recentReport() {
    return 'Test Success';
  }
}
