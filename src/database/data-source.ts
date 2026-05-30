import 'dotenv/config';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { createDataSourceOptions, loadDbConfig } from '../common/utils/db-config';
import { getEnv } from '../common/utils/env';

const mainOptions = createDataSourceOptions(
  loadDbConfig(
    'DB_',
    getEnv('DB_NAME'),
    join(__dirname, 'migrations', 'main', '*.ts'),
    join(__dirname, 'models', '**', '*.entity{.ts,.js}'),
  ),
);

export const appDataSourceOptions: DataSourceOptions[] = [mainOptions];

export default new DataSource(mainOptions);
