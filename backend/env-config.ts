// This should only be used when environment variables need to be loaded outside
// of the main app, e.g., in scripts
import path from 'node:path';

import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '.env'), quiet: true });
