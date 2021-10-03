import { MockedRequest, RequestHandler } from 'msw';
import setCookie from 'set-cookie-parser';
import { Entry, Header as HARHeader, Cookie as HARCookie } from 'har-format';
import { HeadersObject, headersToObject } from 'headers-utils/lib';
import { TrackedRequest } from '..';
import { fromTraffic } from './source';

const normalizeValueAsString = (value: string | string[]): string => {
  return Array.isArray(value) ? value.join(', ') : value;
};

function buildHARHeaders(headers: HeadersObject): HARHeader[] {
  const result = Object.keys(headers).map(name => ({
    name,
    value: normalizeValueAsString(headers[name]),
  }));

  return result;
}

function buildHARCookies(cookies: Record<string, string>): HARCookie[] {
  return Object.keys(cookies).map(name => ({
    name,
    value: cookies[name],
  }));
}

function buildResponseCookies(headers: HeadersObject) {
  const cookies: HARCookie[] = [];

  const setCookies = headers['set-cookie'];

  if (setCookies) {
    for (const headerValue of setCookies) {
      let parsed: setCookie.Cookie[];
      try {
        parsed = setCookie.parse(headerValue);
      } catch (err) {
        return;
      }
      for (const cookie of parsed) {
        const { name, value, path, domain, expires, httpOnly, secure } = cookie;
        const harCookie: HARCookie = {
          name,
          value,
          httpOnly: httpOnly ?? false,
          secure: secure ?? false,
          path,
          domain,
          expires: expires?.toISOString(),
        };

        cookies.push(harCookie);
      }
    }
  }

  return cookies;
}

const convertCapturedLifecycleToHAR = async (
  time: number,
  request: MockedRequest,
  res: Response
) => {
  const response = res.clone();
  let entry: Entry = {
    time,
    startedDateTime: new Date().toISOString(),
    cache: {
      beforeRequest: null,
      afterRequest: null,
    },
    timings: {
      blocked: -1,
      dns: -1,
      connect: -1,
      send: 0,
      wait: 0,
      receive: 0,
      ssl: -1,
    },
    request: {
      httpVersion: 'HTTP/1.1', // TODO: Can we capture this?
      method: request.method,
      url: request.url.href,
      cookies: buildHARCookies(request.cookies),
      headers: request.headers as any,
      queryString: [...(request.url.searchParams as any)].map(
        ([name, value]) => ({
          name,
          value,
        })
      ),
      headersSize: -1,
      bodySize: -1,
    },
  } as any;

  const text = await response.text();
  const bodySize = Buffer.byteLength(text);

  const headers = headersToObject(response.headers);

  entry.response = {
    status: response.status,
    statusText: response.statusText,
    // httpVersion,
    cookies: buildResponseCookies(headers),
    headers: buildHARHeaders(headers),
    content: {
      mimeType: headers['content-type'],
      text,
      size: bodySize,
    },
    redirectURL: headers['location'] || '',
    headersSize: -1,
    bodySize: -1,
  } as any;

  entry.response.content.text = text;
  entry.response.content.size = bodySize;

  return entry;
};

function createHarLog(entries: Entry[] = []) {
  return {
    log: {
      version: '1.1',
      creator: {
        version: '1',
        name: 'msw-toolbar',
      },
      entries,
    },
  };
}

async function buildHandlersForTrackedRequests(
  trackedRequests: TrackedRequest
): Promise<RequestHandler[]> {
  let entries = [];
  for (const [, { request, response, time }] of trackedRequests.entries()) {
    if (!response) continue;
    const harEntry = await convertCapturedLifecycleToHAR(
      time,
      request,
      response
    );
    entries.push(harEntry);
  }
  const harLog = createHarLog(entries);

  return fromTraffic(harLog);
}

export {
  convertCapturedLifecycleToHAR,
  createHarLog,
  buildHandlersForTrackedRequests,
};
