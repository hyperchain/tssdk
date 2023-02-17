SHELL_FOLDER=$(cd "$(dirname "$0")";pwd) # scripts absolute path

cd ${SHELL_FOLDER}/../../../ # cd sdk root
npm run link

cd ${SHELL_FOLDER}/../ # cd examples root
npx yalc add @hyperchain/jssdk
npx yalc update @hyperchain/jssdk
