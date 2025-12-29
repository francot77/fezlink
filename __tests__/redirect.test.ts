// __tests__/redirect.test.ts
import { GET } from '@/app/[slug]/route';
import { NextRequest } from 'next/server';
import * as analytics from '@/lib/emitAnalyticsEvent';

jest.mock('@/lib/emitAnalyticsEvent');


describe('Redirect analytics', () => {
    it('emits a click event and redirects', async () => {
        const emitSpy = jest
            .spyOn(analytics, 'emitAnalyticsEvent')
            .mockResolvedValue(undefined);

        const req = new NextRequest('http://localhost/test-slug', {
            headers: {
                'user-agent': 'jest',
                'x-vercel-ip-country': 'AR',
            },
        });

        const res = await GET(req, {
            params: Promise.resolve({ slug: 'test-slug' }),
        });

        expect(res.status).toBe(301);
        expect(emitSpy).toHaveBeenCalledTimes(1);

        const eventArg = emitSpy.mock.calls[0][0];

        expect(eventArg.type).toBe('click');
        expect(eventArg.country).toBeDefined();
        expect(eventArg.timestamp).toBeInstanceOf(Date);
    });
});


it('redirects regardless of analytics outcome', async () => {
    jest
        .spyOn(analytics, 'emitAnalyticsEvent')
        .mockResolvedValue(undefined);

    const req = new NextRequest('http://localhost/test-slug');

    const res = await GET(req, {
        params: Promise.resolve({ slug: 'test-slug' }),
    });

    expect(res.status).toBe(301);
});


jest.mock('@/app/models/links', () => ({
    Link: {
        findOne: jest.fn().mockResolvedValue({
            _id: 'linkId',
            userId: 'userId',
            destinationUrl: 'https://google.com',
        }),
    },
}));
