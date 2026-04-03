import { MODULE_METADATA } from '@nestjs/common/constants';
import { MinioModule } from './minio.module';
import { MinioService } from './minio.service';

describe('MinioModule', () => {
  it('should export MinioService and MINIO_CLIENT', () => {
    const exportsMetadata = Reflect.getMetadata(MODULE_METADATA.EXPORTS, MinioModule);

    expect(exportsMetadata).toContain(MinioService);
    expect(exportsMetadata).toContain('MINIO_CLIENT');
  });

  it('should define MINIO_CLIENT provider', () => {
    const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, MinioModule);
    const minioProvider = providers.find(
      (provider: { provide?: string }) => provider?.provide === 'MINIO_CLIENT',
    );

    expect(minioProvider).toBeDefined();
  });
});
