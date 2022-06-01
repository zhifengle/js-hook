type SearchPattern = string | RegExp;

type CodeInfo = {
  codeAddress: string;
  codeName: string;
};

// Firefox add@http://localhost:3000/libs/t.js:2:14
// Chrome 的结果 "    at add (http://localhost:3000/libs/t2.js:158:3)"
function parseCodeLocation(codeLocation: string): CodeInfo {
  const codeInfo: CodeInfo = {} as CodeInfo;
  let matcher = codeLocation.match(/\((.+?)\)/);
  if (matcher != null && matcher.length > 1) {
    codeInfo.codeAddress = matcher[1];
  } else {
    codeInfo.codeAddress = codeLocation;
  }

  matcher = codeLocation.match(/at (.+?)\(/);
  if (matcher != null && matcher.length > 1) {
    codeInfo.codeName = matcher[1];
  }

  return codeInfo;
}

// @TODO 扩展字符串和没做
function isTargetValue(value: string, pattern: string | RegExp) {
  if (pattern instanceof RegExp) {
    return pattern.test(value);
  } else {
    return value === pattern;
  }
}

function search(fieldName: keyof StringDB, pattern: SearchPattern) {
  const varValueDb = window.e_user_string_db;
  return varValueDb.filter((item) => {
    return isTargetValue(String(item[fieldName]), pattern);
  });
}

function printResult(results: StringDB[]) {
  let message = '\n在线程栈： \n' + window.location.href + '\n';
  if (!results.length) {
    message += '中没有搜索到结果。\n\n';
    console.log(message);
    console.log('\n\n\n');
    return;
  }

  message += `中搜到${results.length}条结果： \n\n`;
  console.log(message);
  const colunms = [
    '变量名',
    '变量值',
    '变量类型',
    '所在函数',
    '执行次数',
    '执行顺序',
    // '代码位置',
  ];
  const executeTimes = window.e_user_execute_times;
  const displayResults = results.map((item) => {
    const codeInfo = parseCodeLocation(item.codeLocation);
    return {
      变量名: item.name,
      变量值: item.value,
      变量类型: item.type,
      所在函数: codeInfo.codeName,
      执行次数: executeTimes[item.codeLocation],
      执行顺序: item.execOrder,
      代码位置: codeInfo.codeAddress,
    };
  });
  // 这种方式不行。url识别不了
  console.table(displayResults, colunms);
  displayResults.forEach((item, idx) => {
    console.log(
      `%c${idx}.%c ${item['变量名']}${blank(5)}${item['代码位置']}`,
      'background: #222; color: #bada55',
      ''
    );
  });
}

function blank(n: number) {
  return new Array(n).fill(' ').join('');
}

export function searchByValue(pattern: SearchPattern) {
  const targets = search('value', pattern);
  printResult(targets);
}
