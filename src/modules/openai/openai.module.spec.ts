import { MODULE_METADATA } from '@nestjs/common/constants';
import { OpenaiModule } from './openai.module';
import { OpenaiService } from './openai.service';

describe('OpenaiModule', () => {
  it('should export OpenaiService', () => {
    const exportsMetadata = Reflect.getMetadata(MODULE_METADATA.EXPORTS, OpenaiModule);
    expect(exportsMetadata).toContain(OpenaiService);
  });

  it('should define OPENAI_CLIENT provider', () => {
    const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, OpenaiModule);
    const openaiProvider = providers.find(
      (provider: { provide?: string }) => provider?.provide === 'OPENAI_CLIENT',
    );

    expect(openaiProvider).toBeDefined();
  });
});
