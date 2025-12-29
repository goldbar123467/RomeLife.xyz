'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalBackdrop, modalContent, modalSlideUp } from '@/lib/animations';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    variant?: 'default' | 'slideUp';
    showCloseButton?: boolean;
    closeOnBackdrop?: boolean;
    closeOnEscape?: boolean;
    className?: string;
}

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-[95vw] max-h-[95vh]',
};

export function Modal({
    isOpen,
    onClose,
    children,
    size = 'md',
    variant = 'default',
    showCloseButton = false,
    closeOnBackdrop = true,
    closeOnEscape = true,
    className = '',
}: ModalProps) {
    // Handle escape key
    const handleEscape = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape' && closeOnEscape) {
                onClose();
            }
        },
        [closeOnEscape, onClose]
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleEscape]);

    const contentVariants = variant === 'slideUp' ? modalSlideUp : modalContent;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    initial="initial"
                    animate="animate"
                    exit="exit"
                >
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
                        variants={modalBackdrop}
                        onClick={closeOnBackdrop ? onClose : undefined}
                    />

                    {/* Content */}
                    <motion.div
                        className={`relative w-full mx-4 ${sizeClasses[size]} ${className}`}
                        variants={contentVariants}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-lg bg-bg/50 hover:bg-bg text-muted hover:text-ink transition-colors z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}

                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Pre-styled modal variants for common use cases
interface StyledModalProps extends Omit<ModalProps, 'children'> {
    title?: string;
    children: React.ReactNode;
}

export function GoldModal({ title, children, ...props }: StyledModalProps) {
    return (
        <Modal {...props}>
            <div className="bg-gradient-to-br from-paper-light to-paper rounded-3xl border-2 border-roman-gold/30 shadow-glow-gold p-6 md:p-8">
                {title && (
                    <h2 className="text-2xl md:text-3xl font-bold text-roman-gold text-center mb-6">
                        {title}
                    </h2>
                )}
                {children}
            </div>
        </Modal>
    );
}

export function DarkModal({ title, children, ...props }: StyledModalProps) {
    return (
        <Modal {...props}>
            <div className="bg-paper rounded-2xl border border-line p-6">
                {title && (
                    <h2 className="text-xl font-bold text-ink mb-4">
                        {title}
                    </h2>
                )}
                {children}
            </div>
        </Modal>
    );
}
