import { registerCronJob as registerCacheCronJob } from '@/cache/cron';
import { registerCronJob as registerSocketsCronJob } from '@/sockets/cron';

registerCacheCronJob();
registerSocketsCronJob();
