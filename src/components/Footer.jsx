export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-8">
      <div className="container mx-auto px-4 text-center">
        <div className="space-y-2">
          <div className="text-sm">
            Made with Love <span className="text-red-500">❤️</span> with help of{' '}
            <a
              href="https://cursor.sh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Cursor Pro
            </a>
          </div>
          <div className="text-sm">
            Powered by{' '}
            <a
              href="https://hupp.tech/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline font-semibold"
            >
              Hupp Technologies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
