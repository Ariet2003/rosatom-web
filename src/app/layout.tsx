import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'StartAtom — РосКвиз от РосАтом',
  description: 'Проверь свои знания и получи шанс попасть в одну из самых технологичных компаний страны!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}