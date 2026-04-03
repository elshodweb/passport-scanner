import { MODULE_METADATA } from '@nestjs/common/constants';
import { PassportModule } from './passport.module';
import { PassportController } from './passport.controller';
import { PassportService } from './passport.service';

describe('PassportModule', () => {
  it('should register PassportController', () => {
    const controllers = Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, PassportModule);
    expect(controllers).toContain(PassportController);
  });

  it('should register PassportService', () => {
    const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, PassportModule);
    expect(providers).toContain(PassportService);
  });
});
