import { parse, ParseResult, traverse } from '@babel/core';
import template from '@babel/template';
import generate, { GeneratorOptions } from '@babel/generator';
import * as types from '@babel/types';
import type { CallExpression, Expression } from '@babel/types';
import { HOOK_FUCTION_NAME } from '../constants';

function genHookCall(
  ident: string,
  exp: Expression,
  type: HookCallType
): CallExpression {
  const args = [types.stringLiteral(ident), exp, types.stringLiteral(type)];
  return types.callExpression(types.identifier(HOOK_FUCTION_NAME), args);
}

function genFunctionBody(
  node: types.FunctionDeclaration | types.FunctionExpression
) {
  const tpl = template(`{
      FUNCTION_PARAMETER_CALLS
      DEFAULT_BODY
}`);
  const stmts = node.params
    .map((p) => {
      let ident: types.Identifier;
      if (types.isIdentifier(p)) {
        ident = p;
      } else if (types.isAssignmentPattern(p)) {
        // function({ a } = { a: 1 }) { }
        // 对应的ast:  left ObjectPattern; right: ObjectExpression;
        // 这种情况下 ident.name 是空的. 暂时没有处理这种代码。types.stringLiteral 报错
        ident = p.left as types.Identifier;
      } else if (types.isRestElement(p)) {
        ident = p.argument as types.Identifier;
      } else {
        // 未知的类型跳过
        return;
      }
      return types.expressionStatement(
        genHookCall(ident.name, ident, 'function-parameter')
      );
    })
    .filter((s) => s);
  return tpl({
    FUNCTION_PARAMETER_CALLS: stmts,
    DEFAULT_BODY: node.body.body,
  }) as types.BlockStatement;
}

// https://github.com/CC11001100/ast-hook-for-js-RE/blob/master/src/components/global-assign-hook-component/core/inject-hook.js
export function genHookAST(code: string): ParseResult {
  const ast = parse(code);
  // { } 内容是 visitor
  // https://astexplorer.net/ 结构参考
  traverse(ast, {
    // 变量声明
    VariableDeclaration(path) {
      const node = path.node;
      if (!node.declarations?.length) {
        return;
      }
      for (let variableDeclarator of node.declarations) {
        if (!variableDeclarator.init) {
          continue;
        }
        // 跳过 var x = (a, b) => a + b;
        if (types.isFunctionExpression(variableDeclarator.init)) {
          try {
            variableDeclarator.init.body = genFunctionBody(
              variableDeclarator.init
            );
          } catch (e) {
            console.error(e);
          }
          continue;
        }
        // MemberExpression
        // let identifier = variableDeclarator.id.name;
        // ObjectPattern ??  var { a: c} = obj;
        let identifier = generate(variableDeclarator.id).code;
        try {
          variableDeclarator.init = genHookCall(
            identifier,
            variableDeclarator.init,
            'var-init'
          );
        } catch (e) {
          console.error(e);
        }
      }
    },
    AssignmentExpression(path) {
      const node = path.node;
      if (types.isFunctionExpression(node)) {
        return;
      }
      let identifier = generate(node.left).code;
      try {
        node.right = genHookCall(identifier, node.right, 'assign');
      } catch (e) {
        console.error(e);
      }
    },
    ObjectExpression(path) {
      const node = path.node;
      if (!node.properties?.length) {
        return;
      }
      for (let props of node.properties) {
        // TODO: method rest
        if (types.isObjectProperty(props)) {
          const propertyValue = props.value;
          if (!propertyValue) {
            return;
          }
          if (types.isFunctionExpression(propertyValue)) {
            continue;
          }
          if (types.isObjectExpression(propertyValue)) {
            continue;
          }
          let ident = '';
          if (types.isIdentifier(props.key)) {
            ident = props.key.name;
          }
          try {
            // TODO 不能处理的语法绕过
            // @ts-ignore
            props.value = genHookCall(ident, propertyValue, 'object-key-init');
          } catch (e) {
            console.error(e);
          }
        }
      }
    },
    FunctionDeclaration(path) {
      const node = path.node;
      if (!node.params?.length) {
        return;
      }
      try {
        node.body = genFunctionBody(node);
      } catch (e) {
        console.error(e);
      }
    },
  });
  return ast;
}
export function inject(code: string, genOpt?: GeneratorOptions): string {
  const ast = genHookAST(code);
  // Node = Identifier | ArrayExpression | xx
  return generate(ast, genOpt).code;
}
