import { useThemeStore } from "@/stores/themeStore";
import { ThemeSelector } from "./ThemeSelector";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";

export default function ThemeDemo() {
    const { currentTheme } = useThemeStore();
  
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-4">Theme System Demo</h1>
          <p className="text-gray-600 mb-6">
            Switch between different themes to see how the button component adapts. 
            The pixel themes (NES/SNES) use cut-corner borders and press effects, 
            while the default theme uses modern styling.
          </p>
          <ThemeSelector />
        </div>
  
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Current Theme: {currentTheme.name}
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Button Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Primary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
              </div>
            </div>
  
            <div>
              <h3 className="text-lg font-medium mb-3">Button Sizes</h3>
              <div className="flex items-end gap-3">
                <Button variant="default" size="sm">Small</Button>
                <Button variant="default" size="default">Default</Button>
                <Button variant="default" size="lg">Large</Button>
              </div>
            </div>
  
            <div>
              <h3 className="text-lg font-medium mb-3">Interactive Example</h3>
              <div className="p-6 bg-gray-50 rounded-lg">
                <p className="mb-4 text-gray-700">
                  Try clicking and holding the buttons to see the press effects:
                </p>
                <div className="flex gap-3">
                  <Input variant="default" placeholder="Input" />
                  <Input variant="destructive" placeholder="Input" />
                  <Input variant="outline" placeholder="Input" />
                  <Input variant="secondary" placeholder="Input" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Select</h3>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Option 1</SelectItem>
              <SelectItem value="2">Option 2</SelectItem>
              <SelectItem value="3">Option 3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Card</h3>
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Card Content</p>
            </CardContent>
            <CardFooter>
              <p>Card Footer</p>
            </CardFooter>
          </Card>
        </div>
  
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Implementation Notes:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Themes are defined in a centralized configuration</li>
            <li>• Components automatically adapt based on the current theme type</li>
            <li>• Pixel themes include border size and corner-cutting configuration</li>
            <li>• Press effects are handled automatically for pixel themes</li>
            <li>• Easy to extend with new themes and components</li>
          </ul>
        </div>
      </div>
    );
  }