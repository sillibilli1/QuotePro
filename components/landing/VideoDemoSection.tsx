'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import Image from 'next/image';

export function VideoDemoSection() {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <section className="relative bg-slate-900/50 px-4 py-24 md:py-32">
            <div className="mx-auto max-w-6xl text-center">
                {/* Heading */}
                <div className="mb-12 reveal-up">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        See QuotePro in Action
                    </h2>
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
                        Watch how easy it is to create, send, and track quotes in under 60 seconds.
                    </p>
                </div>

                {/* Video Container */}
                <div className="reveal-up mx-auto max-w-4xl" style={{ animationDelay: '120ms' }}>
                    <div className="relative aspect-video rounded-2xl border-2 border-teal-500/30 bg-slate-950 shadow-[0_0_60px_rgba(20,184,166,0.15)] overflow-hidden">
                        {!isPlaying ? (
                            <div
                                onClick={() => setIsPlaying(true)}
                                className="relative w-full h-full group cursor-pointer hover:border-teal-500/50 transition-all duration-300"
                            >
                                {/* Thumbnail */}
                                <Image
                                    src="/images/video-thumbnail.png"
                                    alt="Video thumbnail"
                                    fill
                                    className="object-cover opacity-50 group-hover:opacity-70 transition-opacity"
                                />

                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-slate-950/50" />

                                {/* Play button */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative">
                                        {/* Glow effect */}
                                        <div className="absolute inset-0 rounded-full bg-teal-500/30 blur-2xl group-hover:bg-teal-500/40 transition-all duration-300" />

                                        {/* Play icon */}
                                        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-teal-500 shadow-lg group-hover:scale-110 group-hover:bg-teal-400 transition-all duration-300">
                                            <Play className="h-8 w-8 text-slate-950 fill-current ml-1" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <video
                                controls
                                autoPlay
                                playsInline
                                preload="auto"
                                className="w-full h-full rounded-2xl outline-none object-cover bg-slate-950"
                            >
                                <source src="/videos/demo.mp4" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
