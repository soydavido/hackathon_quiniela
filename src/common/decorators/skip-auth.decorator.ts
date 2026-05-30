import { SetMetadata } from '@nestjs/common';
import { SKIP_AUTH_KEY } from '../guards/team-auth.guard';

export const SkipAuth = () => SetMetadata(SKIP_AUTH_KEY, true);
