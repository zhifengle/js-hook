import { inject } from './inject';

describe('VariableDeclaration', () => {
  test('init Literal', () => {
    let code = `var a = 1`;
    expect(inject(code)).toBe('var a = e_user_hook("a", 1, "var-init");');
    code = `const a = "abc"`;
    expect(inject(code)).toBe(`const a = e_user_hook("a", "abc", "var-init");`);
    code = `const a = obj.b.c;`;
    expect(inject(code)).toBe(
      `const a = e_user_hook("a", obj.b.c, "var-init");`
    );
  });
  test('init FunctionExpression', () => {
    let code = `
    var x = function test(a, b) {
  console.log(a, b);
};
    `;
    expect(inject(code, { minified: true })).toBe(
      'var x=function test(a,b){e_user_hook("a",a,"function-parameter");e_user_hook("b",b,"function-parameter");console.log(a,b)};'
    );
  });
  // @TODO
  test('init ArrowFunctionExpression', () => {
    let code = `
    var x = (a, b) => {
  console.log(a, b);
};
    `;
    // expect(inject(code, { minified: true })).toBe(
    //   'var x=function test(a,b){e_user_hook("a",a,"function-parameter");e_user_hook("b",b,"function-parameter");console.log(a,b)};'
    // );
  });
});

describe('ObjectExpression', () => {
  test('init ObjectExpression', () => {
    let code = `var obj = {
  a: 1,
  b: {
    c: x
  }
}`;
    expect(inject(code, { minified: true })).toBe(
      'var obj=e_user_hook("obj",{a:e_user_hook("a",1,"object-key-init"),b:{c:e_user_hook("c",x,"object-key-init")}},"var-init");'
    );
  });
});

describe('FunctionDeclaration', () => {
  test('init FunctionDeclaration', () => {
    let code = `function test(a, b = 1) {
  console.log(a, b);
}`;
    expect(inject(code, { minified: true })).toBe(
      `function test(a,b=1){e_user_hook("a",a,"function-parameter");e_user_hook("b",b,"function-parameter");console.log(a,b)}`
    );
  });
  test('ObjectPattern', () => {
    // 这种语法还没有处理 2022-05-06
    var code = `function test({a} = {a: 1}) {
  console.log(a);
}`;
    // console.log(inject(code, { minified: true }));
  });
  test('RestElement', () => {
    var code = `function test(...args) {
  console.log(a);
}`;
    expect(inject(code, { minified: true })).toBe(
      `function test(...args){e_user_hook("args",args,"function-parameter");console.log(a)}`
    );
  });
});
