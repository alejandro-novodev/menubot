/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { ChatBubble } from '@/components/ChatBubble';

describe('ChatBubble', () => {
  it('renders user message content', () => {
    render(<ChatBubble message="Hola, ¿qué platos tienen?" role="user" />);
    expect(screen.getByText('Hola, ¿qué platos tienen?')).toBeInTheDocument();
  });

  it('renders assistant message content', () => {
    render(<ChatBubble message="¡Hola! Tenemos Karaage y Ramen." role="assistant" />);
    expect(screen.getByText('¡Hola! Tenemos Karaage y Ramen.')).toBeInTheDocument();
  });

  it('applies accent styling for user messages', () => {
    const { container } = render(<ChatBubble message="test" role="user" />);
    const hasAccent = Array.from(container.querySelectorAll<HTMLElement>('*'))
      .some(el => el.style?.background?.includes('--accent'));
    expect(hasAccent).toBe(true);
  });

  it('applies surface styling for assistant messages', () => {
    const { container } = render(<ChatBubble message="test" role="assistant" />);
    const hasSurface = Array.from(container.querySelectorAll<HTMLElement>('*'))
      .some(el => el.style?.background?.includes('--mb-surface'));
    expect(hasSurface).toBe(true);
  });

  it('aligns user messages to the right', () => {
    const { container } = render(<ChatBubble message="test" role="user" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.justifyContent).toBe('flex-end');
  });

  it('does not right-align assistant messages', () => {
    const { container } = render(<ChatBubble message="test" role="assistant" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.justifyContent).not.toBe('flex-end');
  });

  it('renders multiline messages correctly', () => {
    const multiline = 'Primera línea\nSegunda línea';
    const { container } = render(<ChatBubble message={multiline} role="assistant" />);
    expect(container.textContent).toContain('Primera línea');
    expect(container.textContent).toContain('Segunda línea');
  });

  it('renders **bold** markdown as <strong>', () => {
    const { container } = render(<ChatBubble message="Prueba **Edamame** rico" role="assistant" />);
    const strong = container.querySelector('strong');
    expect(strong?.textContent).toBe('Edamame');
  });
});
