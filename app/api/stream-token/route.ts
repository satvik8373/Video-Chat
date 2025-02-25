            import { NextRequest, NextResponse } from 'next/server';
            import { StreamChat } from 'stream-chat';

            export async function POST(req: NextRequest) {
            try {
                const { userId } = await req.json();

                if (!userId) {
                console.error('No userId provided');
                return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
                }

                if (!process.env.NEXT_PUBLIC_STREAM_API_KEY || !process.env.STREAM_SECRET_KEY) {
                console.error('Stream API credentials missing:', {
                    apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY,
                    secret: process.env.STREAM_SECRET_KEY,
                });
                return NextResponse.json({ error: 'Stream API credentials missing' }, { status: 500 });
                }

                const streamClient = StreamChat.getInstance(
                process.env.NEXT_PUBLIC_STREAM_API_KEY,
                process.env.STREAM_SECRET_KEY
                );

                const token = streamClient.createToken(userId);
                console.log('Generated token for user:', userId, 'Token:', token);
                return NextResponse.json({ token });
            } catch (error) {
                console.error('Error generating Stream token:', error);
                return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
            }
            }