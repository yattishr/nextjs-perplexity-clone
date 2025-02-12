import { LinkIcon } from "@heroicons/react/16/solid";

function Sources({ sources }: { sources: string[] }) {
    return (
      <div className="mt-8 space-y-2">
        <h3 className="font-medium text-sm text-gray-600">Sources</h3>
        <div className="space-y-2">
          {sources.map((source, i) => (
            <a 
              key={i}
              href={source}
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkIcon className="h-4 w-4" />
              {new URL(source).hostname}
            </a>
          ))}
        </div>
      </div>
    )
  }