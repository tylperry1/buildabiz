import {test} from 'node:test';import assert from 'node:assert/strict';
import {decodeResponse,pageNumber,encodeFilter} from '../src/lib/http.mjs';
test('PostgREST empty 201 and 204 writes succeed without JSON parsing errors',async()=>{assert.equal(await decodeResponse(new Response('',{status:201})),null);assert.equal(await decodeResponse(new Response(null,{status:204})),null);});
test('JSON objects and primitive RPC values are decoded',async()=>{assert.deepEqual(await decodeResponse(new Response('[{"id":"saved"}]')),[{id:'saved'}]);assert.equal(await decodeResponse(new Response('true')),true);});
test('failed requests do not reveal response bodies',async()=>{await assert.rejects(decodeResponse(new Response('private SQL details',{status:403})),{message:'Service request failed (403)'});});
test('page boundaries and PostgREST filter quoting are bounded',()=>{assert.equal(pageNumber('-1'),1);assert.equal(pageNumber('abc'),1);assert.equal(pageNumber('900000'),10000);assert.equal(pageNumber('2'),2);assert.equal(decodeURIComponent(encodeFilter('a"b\\c')),'"a\\"b\\\\c"');});
