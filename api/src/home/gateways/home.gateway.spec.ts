import { Test, TestingModule } from '@nestjs/testing';
import { HomeGatewayGateway } from './home.gateway';

describe('HomeGatewayGateway', () => {
  let gateway: HomeGatewayGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HomeGatewayGateway],
    }).compile();

    gateway = module.get<HomeGatewayGateway>(HomeGatewayGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
