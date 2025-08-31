import React, { useState, useEffect } from 'react';
import { Bot, Plus, Trash2, Edit3 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

interface BotResponse {
  id: string;
  trigger: string;
  response: string;
  isActive: boolean;
  createdAt: string;
}

export function BotManager() {
  const [botResponses, setBotResponses] = useState<BotResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResponse, setEditingResponse] = useState<BotResponse | null>(null);
  const [formData, setFormData] = useState({ trigger: '', response: '' });

  useEffect(() => {
    fetchBotResponses();
  }, []);

  const fetchBotResponses = async () => {
    try {
      const response = await fetch('/api/bot/responses');
      const data = await response.json();
      setBotResponses(data);
    } catch (error) {
      console.error('Error fetching bot responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/bot/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        await fetchBotResponses();
        setFormData({ trigger: '', response: '' });
        setIsDialogOpen(false);
        setEditingResponse(null);
      }
    } catch (error) {
      console.error('Error saving bot response:', error);
    }
  };

  const handleEdit = (botResponse: BotResponse) => {
    setEditingResponse(botResponse);
    setFormData({ trigger: botResponse.trigger, response: botResponse.response });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this bot response?')) {
      try {
        await fetch(`/api/bot/responses/${id}`, { method: 'DELETE' });
        await fetchBotResponses();
      } catch (error) {
        console.error('Error deleting bot response:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Bot responses
          </h2>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingResponse(null);
              setFormData({ trigger: '', response: '' });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add response
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingResponse ? 'Edit' : 'Add response'}
              </DialogTitle>
              <DialogDescription>
                Create automated responses for specific triggers in chat.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Trigger
                </label>
                <Input
                  value={formData.trigger}
                  onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                  placeholder="e.g., hello, help, info"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Response
                </label>
                <Textarea
                  value={formData.response}
                  onChange={(e) => setFormData({ ...formData, response: e.target.value })}
                  placeholder="Bot response message..."
                  required
                  rows={3}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {botResponses.map((botResponse) => (
          <Card key={botResponse.id}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="truncate">/{botResponse.trigger}</span>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(botResponse)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(botResponse.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Trigger: {botResponse.trigger}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                {botResponse.response}
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span className={`px-2 py-1 rounded-full ${
                  botResponse.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {botResponse.isActive ? 'Active' : 'Inactive'}
                </span>
                <span>
                  {new Date(botResponse.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {botResponses.length === 0 && (
        <div className="text-center py-12">
          <Bot className="mx-auto w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No bot responses yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create automated responses to help users in your chat rooms.
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add response
          </Button>
        </div>
      )}
    </div>
  );
}
