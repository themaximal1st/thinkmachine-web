import { notarize } from '@electron/notarize';

export default async function notarizing(context) {

  console.log("NOTARIZING");
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }
  console.log("NOTARIZING", appOutDir);

  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    tool: "notarytool",
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS,
    teamId: process.env.APPLETEAMID,
  });
};
