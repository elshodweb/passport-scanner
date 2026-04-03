import { MODULE_METADATA } from '@nestjs/common/constants';
import { AppModule } from './app.module';
import { DatabaseModule } from './modules/database/database.module';
import { MinioModule } from './modules/minio/minio.module';
import { OpenaiModule } from './modules/openai/openai.module';
import { PassportModule } from './modules/passport/passport.module';

describe('AppModule', () => {
  it('should import feature modules', () => {
    const importsMetadata = Reflect.getMetadata(MODULE_METADATA.IMPORTS, AppModule);

    expect(importsMetadata).toBeDefined();
    expect(importsMetadata).toContain(PassportModule);
    expect(importsMetadata).toContain(OpenaiModule);
    expect(importsMetadata).toContain(MinioModule);
    expect(importsMetadata).toContain(DatabaseModule);
  });
});
