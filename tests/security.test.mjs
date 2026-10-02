import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (name) => readFileSync(resolve(root, name), 'utf8');
const attribute = (tag, name) => tag.match(new RegExp(`\\b${name}=(["'])(.*?)\\1`, 'i'))?.[2];

for (const page of ['index.html', 'privacy.html']) {
  test(`${page} restricts presentation before any resource is loaded`, () => {
    const html = read(page);
    const meta = html.match(/<meta\b[^>]*http-equiv="Content-Security-Policy"[^>]*>/i)?.[0];
    assert.ok(meta, 'The static host requires a meta CSP');
    const directives = new Map(attribute(meta, 'content').split(';').map((part) => {
      const [name, ...values] = part.trim().split(/\s+/);
      return [name, values.join(' ')];
    }));
    for (const name of ['default-src', 'base-uri', 'form-action']) assert.equal(directives.get(name), "'none'");
    for (const name of ['style-src', 'font-src', 'img-src']) assert.equal(directives.get(name), "'self'");
    assert.ok(html.indexOf(meta) < html.indexOf('<link'));
    assert.doesNotMatch(html, /<script\b|<style\b|\sstyle=|\son\w+=|<base\b/i);
  });

  test(`${page} loads only local, present presentation assets`, () => {
    for (const tag of read(page).match(/<link\b[^>]*>|<img\b[^>]*>/gi) ?? []) {
      const resource = attribute(tag, 'href') ?? attribute(tag, 'src');
      assert.ok(resource?.startsWith('./'), `Unexpected remote or ambiguous resource: ${tag}`);
      assert.ok(existsSync(resolve(root, resource)), `Missing ${resource}`);
    }
  });
}

test('CSS cannot add remote imports or resources', () => {
  const css = read('assets/site.css');
  assert.doesNotMatch(css, /@import/i);
  for (const match of css.matchAll(/url\(["']?([^"')]+)["']?\)/gi)) {
    assert.ok(match[1].startsWith('./fonts/'), `Unexpected resource ${match[1]}`);
    assert.ok(existsSync(resolve(root, 'assets', match[1])));
  }
  assert.match(css, /font-family:\s*"Manrope"/);
  assert.match(css, /font-family:\s*"Cormorant Garamond"/);
});

test('font and license files match the reviewed upstream blobs', () => {
  const expected = {
    'Manrope.ttf': '75274da58537d6123b14f2cd0c355ad4681fc2b3',
    'CormorantGaramond.ttf': 'd992a83ce525c330fad3a19087746bcb2dc038ee',
    'Manrope-OFL.txt': 'e271172a9ed0cddc895aabb6509f1c7d880b492d',
    'CormorantGaramond-OFL.txt': '507d70f4565352dbfcf2dfc9b42eb092b57c0be8',
  };
  for (const [file, digest] of Object.entries(expected)) {
    const data = readFileSync(resolve(root, 'assets/fonts', file));
    const actual = createHash('sha1').update(`blob ${data.length}\0`).update(data).digest('hex');
    assert.equal(actual, digest, file);
  }
});

test('privacy disclosure and navigation remain available', () => {
  assert.match(read('index.html'), /href="\.\/privacy\.html"/);
  assert.match(read('privacy.html'), /href="\.\/index\.html"/);
  assert.match(read('privacy.html'), /<h1>How Spendalf uses financial data<\/h1>/);
  assert.match(read('privacy.html'), /only when explicitly enabled/);
  assert.match(read('privacy.html'), /mailto:barnes\.wendell@gmail\.com/);
});
