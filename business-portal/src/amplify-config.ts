import { Amplify } from 'aws-amplify';
import sandboxOutputs from '../amplify_outputs.json';
import productionOutputs from '../amplify_outputs_production.json';

type Env = 'sandbox' | 'production';

/**
 * Configure AWS Amplify with backend outputs
 *
 * - Defaults to sandbox unless VITE_AMPLIFY_ENV=production is set
 * - Honors a persisted selection in localStorage (amplify_env)
 * - Exposes a helper on window for runtime switching
 */
function resolveEnvironment(): Env {
  const defaultEnv: Env =
    import.meta.env.VITE_AMPLIFY_ENV === 'production' ? 'production' : 'sandbox';

  if (typeof window === 'undefined') {
    return defaultEnv;
  }

  const stored = window.localStorage.getItem('amplify_env') as Env | null;
  return stored === 'production' || stored === 'sandbox' ? stored : defaultEnv;
}

function getConfig(env: Env) {
  return env === 'production' ? productionOutputs : sandboxOutputs;
}

function configureAmplify(env: Env) {
  const config = getConfig(env);
  Amplify.configure(config);
  (window as any).amplifyConfig = config;

  const apiUrl = config?.data?.url || 'Unknown';
  const stackIdMatch = apiUrl.match(/([a-z0-9]{26})/);
  const stackId = stackIdMatch ? stackIdMatch[1] : 'Unknown';

  console.log('🌍 Amplify Environment Info:');
  console.log('  Selected:', env);
  console.log('  API URL:', apiUrl);
  console.log('  Stack ID:', stackId);
  console.log('  Region:', config?.data?.aws_region || 'Unknown');
}

const currentEnv = resolveEnvironment();
configureAmplify(currentEnv);

// Allow runtime switches (component will set and reload)
if (typeof window !== 'undefined') {
  (window as any).setAmplifyEnvironment = (env: Env) => {
    window.localStorage.setItem('amplify_env', env);
    window.location.reload();
  };
}

export default Amplify;
