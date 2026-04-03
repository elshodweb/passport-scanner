import { MODULE_METADATA } from '@nestjs/common/constants';
import { DatabaseModule } from './database.module';

describe('DatabaseModule', () => {
  it('should configure imports', () => {
    const importsMetadata = Reflect.getMetadata(MODULE_METADATA.IMPORTS, DatabaseModule);

    expect(importsMetadata).toBeDefined();
    expect(importsMetadata).toHaveLength(1);
  });
});
