import { ActionExecutor } from './ActionExecutor.js';
import { actionUtil } from '../utils/actionUtil.js';
import { RunScript } from './RunScript.js';
import fs from 'fs';
import path from 'path';

const prompt = fs.readFileSync(path.join(process.cwd(), 'pupperio','scripts', 'openChatGpt.txt'), 'utf8');
// let aiBroswserContext = await ActionExecutor.executeAction(null, {
//     type: actionUtil.ActionType.INIT
// });
console.log(prompt);
console.log(actionUtil.readInstructionsFromPrompt(prompt));

//aiBroswserContext = await RunScript.run(aiBroswserContext,[])
