import { PDFForm } from './components/PDFForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Doc2Speech</h1>
          <p className="text-gray-600">Upload your PDF or PowerPoint file to convert it to speech</p>
        </div>
        <PDFForm />
      </div>
    </div>
  );
}
